import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Tag } from "../entities/Tag";

const tagRepository = AppDataSource.getRepository(Tag);

export const createTag = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newTag = tagRepository.create({ name });
    const tag = await tagRepository.save(newTag);
    res.json({ tag, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create tag.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getAllTags = async (req: Request, res: Response) => {
  try {
    const { search, page, limit } = req.query;

    let query = tagRepository.createQueryBuilder("tag");

    // Apply search filter
    if (search) {
      query = query.where("tag.name LIKE :search", { search: `%${search}%` });
    }

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;
    const take = pageSize;

    const [tags, total] = await query
      .skip(skip)
      .take(take)
      .orderBy("tag.updatedAt", "DESC")
      .getManyAndCount();

    const paginationData = {
      page: pageNumber,
      pageSize,
      total,
    };

    res.json({ tags, paginationData, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tags.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const getTagById = async (req: Request, res: Response) => {
  try {
    const { tagId } = req.params;
    const tag = await tagRepository.findOne({ where: { id: Number(tagId) } });
    if (tag) {
      res.json({ tag, success: true });
    } else {
      res.status(404).json({
        message: `Tag not found with id ${tagId}.`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tag.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const updateTagById = async (req: Request, res: Response) => {
  try {
    const { tagId } = req.params;
    const { name } = req.body;
    const tag = await tagRepository.findOne({ where: { id: Number(tagId) } });
    if (tag) {
      tag.name = name || tag.name;
      await tagRepository.save(tag);
      res.json({ tag, success: true });
    } else {
      res.status(404).json({
        message: `Tag not found with id ${tagId}.`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to update tag.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const removeTagById = async (req: Request, res: Response) => {
  try {
    const { tagId } = req.params;
    const tag = await tagRepository.findOne({ where: { id: Number(tagId) } });
    if (tag) {
      await tagRepository.remove(tag);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: `Tag not found with id ${tagId}.`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete tag.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};
