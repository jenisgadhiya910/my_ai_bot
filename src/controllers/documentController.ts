import { Request, Response } from "express";
import { AppDataSource } from "../database/data-source";
import { Document } from "../entities/Document";
import { v4 as uuidv4 } from "uuid";
import { Tag } from "../entities/Tag";

const documentRepository = AppDataSource.getRepository(Document);
const tagRepository = AppDataSource.getRepository(Tag);

export const createDocument = async (req: Request, res: Response) => {
  try {
    let fileUrl = null;
    if (req?.file) {
      const serverUrl =
        process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
      fileUrl = `${serverUrl}/uploads/${req.file.filename}`;
    }
    const { file_name, tags } = req.body;
    const guid = uuidv4();
    const newDocument = documentRepository.create({
      file_name,
      file_url: fileUrl,
      guid,
      tags: tags?.split(",")?.map((tag) => ({ id: Number(tag) })) || [],
    });
    const document = await documentRepository.save(newDocument);
    res.json({ document, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create document.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    let query = documentRepository
      .createQueryBuilder("document")
      .leftJoinAndSelect("document.tags", "tags");

    const { page, limit } = req.query;
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    if (pageNumber && pageSize) {
      const skip = (pageNumber - 1) * pageSize;
      const take = pageSize;
      query = query.skip(skip).take(take);
    }

    const [documents, total] = await query
      .orderBy("document.updatedAt", "DESC")
      .getManyAndCount();

    const paginationData =
      pageNumber && pageSize
        ? {
            page: pageNumber,
            pageSize,
            total,
          }
        : undefined;

    res.json({ documents, paginationData, success: true });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch documents.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error.sqlMessage }),
    });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const document = await documentRepository.findOne({
      where: { id: Number(documentId) },
      relations: ["tags"],
    });
    if (document) {
      res.json({ document, success: true });
    } else {
      res.status(404).json({
        message: `Tag not found with id ${documentId}.`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch document.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const updateDocumentById = async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.documentId || 0);
    const document = await documentRepository.findOne({
      where: {
        id: documentId,
      },
      relations: ["tags"],
    });

    if (document) {
      let fileUrl = null;
      if (req?.file) {
        const serverUrl =
          process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
        fileUrl = `${serverUrl}/uploads/${req.file.filename}`;
      }
      document.file_name = req?.file?.filename || document?.file_name;
      document.file_url = fileUrl || document?.file_url;

      // Update tags
      const { tags } = req.body;
      if (tags) {
        const tagIds = tags.split(",");
        document.tags = await tagRepository
          .createQueryBuilder("tag")
          .where("tag.id IN (:...tagIds)", { tagIds })
          .getMany();
      }

      await documentRepository.save(document);
      res.json({ document, success: true });
    } else {
      res.status(404).json({
        message: `Document not found with id ${documentId}`,
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed to update document.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};

export const removeDocumentById = async (req: Request, res: Response) => {
  try {
    const documentId = Number(req.params.documentId || 0);
    const document = await documentRepository.findOne({
      where: { id: documentId },
    });
    if (document) {
      await documentRepository.remove(document);
      res.json({ success: true });
    } else {
      res.status(404).json({
        message: `Document not found with id ${documentId}.`,
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete document.",
      success: false,
      ...(error?.sqlMessage && { sqlMessage: error?.sqlMessage }),
    });
  }
};
