import { Router, Request, Response, NextFunction } from "express";
import Idea from "../models/Idea";
import mongoose from "mongoose";
import { protect } from "../middleware/authMiddleware";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const router = Router();

// @route GET /api/ideas/id
// @desc  Get single idea
// @access Public
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid idea ID" });
    }
    const idea = await Idea.findById(id);
    res.json(idea);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    next(error);
  }
});

// @route DELETE /api/ideas/:id
// @desc  Delete an idea
// @access Private
router.delete(
  "/:id",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log(id);
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }
      const idea = await Idea.findByIdAndDelete(id);
      if (!idea) {
        res.status(404);
        throw new Error("Idea not found");
      }

      // Check if the idea belongs to the authenticated user
      if (idea.user.toString() !== req.user!.id) {
        res.status(403);
        throw new Error("Not authorized to delete this idea");
      }
      await idea.deleteOne();

      res.json({ message: "Idea deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
      next(error);
    }
  }
);

// @route PUT /api/ideas/:id
// @desc  Update an idea
// @access Private
router.put(
  "/:id",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid idea ID" });
      }

      const idea = await Idea.findById(id);
      if (!idea) {
        res.status(404);
        throw new Error("Idea not found");
      }

      const { title, description, summary, tags } = req.body || {};
      if (!title?.trim() || !description?.trim() || !summary?.trim()) {
        res
          .status(400)
          .json({ message: "Title, description, and summary are required." });
        return;
      }

      // Check if the idea belongs to the authenticated user
      if (idea.user.toString() !== req.user!.id) {
        res.status(403);
        throw new Error("Not authorized to update this idea");
      }

      idea.title = title.trim();
      idea.description = description.trim();
      idea.summary = summary.trim();
      idea.tags =
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [];

      const updatedIdea = await idea.save();
      res.json(updatedIdea);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error" });
      next(error);
    }
  }
);

// @route GET /api/ideas
// @desc  Get all ideas
// @access Public
// @query  _limit (optional) number of ideas to return
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query._limit as string);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit) && limit > 0) {
      query.limit(limit);
    }

    const ideas = await query.exec();
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    next(error);
  }
});

// @route POST /api/ideas
// @desc  Create a new idea
// @access Public
router.post(
  "/",
  protect,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, description, summary, tags } = req.body || {};
      console.log(
        "title: ",
        title,
        "description: ",
        description,
        "summary: ",
        summary
      );
      if (!title?.trim() || !description?.trim() || !summary?.trim()) {
        res
          .status(400)
          .json({ message: "Title, description, and summary are required." });
        return;
      }
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const newIdea = await Idea.create({
        title: title.trim(),
        description: description.trim(),
        summary: summary.trim(),
        tags:
          typeof tags === "string"
            ? tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
            : Array.isArray(tags)
            ? tags
            : [],
        user: req.user.id,
      });

      res.status(201).json(newIdea);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
      next(error);
    }
  }
);

export default router;
