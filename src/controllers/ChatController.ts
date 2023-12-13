import { Request, Response } from "express";
import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { AppDataSource } from "../database/data-source";
import { Chat } from "../entities/chat";
import { History } from "../entities/History";
import { Setting } from "../entities/Setting";
import { DiscussServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
import { Company } from "../entities/company";
import { ExecutedPrompt } from "../entities/ExecutedPrompt";

const MODEL_NAME = "models/chat-bison-001";
const API_KEY = process.env.GOOGLE_AI_API_KEY;

const client = new DiscussServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

const settingRepository = AppDataSource.getRepository(Setting);
const historyRepository = AppDataSource.getRepository(History);
const chatRepository = AppDataSource.getRepository(Chat);
const companyRepository = AppDataSource.getRepository(Company);
const executedPromptRepository = AppDataSource.getRepository(ExecutedPrompt);

export const chat = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const {
      message,
      history_id,
      ai_tool,
      company_name,
      company_website,
      prompt_name,
    } = req.body;

    let history = null;

    if (!history_id) {
      const historyObject = {
        name: req.body?.prompt_name || message,
        user_id: req?.userId,
      };
      const newHistory = historyRepository.create(historyObject);
      history = await historyRepository.save(newHistory);
    } else {
      history = await historyRepository.findOne({
        where: {
          id: history_id,
        },
      });
    }

    const setting = await settingRepository?.findOne({
      where: {
        service_name: "Chat GPT",
        user_id: req.userId,
      },
    });
    let company: any;
    if (company_name) {
      const isCompanyExist = await companyRepository.findOne({
        where: { name: company_name, user_id: req.userId },
      });
      if (!isCompanyExist) {
        const companyData = companyRepository.create({
          name: company_name,
          website: company_website,
          user_id: req.userId,
        });
        company = await companyRepository.save(companyData);
      } else {
        company = isCompanyExist;
      }
    }
    let reply: any;
    if (ai_tool === "bard") {
      const result = await client.generateMessage({
        model: MODEL_NAME,
        prompt: {
          context: "You are a helpful assistant.",
          messages: [{ content: message }],
        },
      });
      reply = result?.[0]?.candidates?.[0]?.content;
      if (!!company) {
        const isExecutedPromptExist = await executedPromptRepository.findOne({
          where: {
            company_id: company?.id,
            name: prompt_name,
          },
        });
        if (!isExecutedPromptExist) {
          const executedPromptData = {
            name: prompt_name,
            prompt: message,
            is_bard: true,
            is_chat_gpt: false,
            bard_response: reply,
            chat_gpt_response: null,
            company_id: company?.id,
          };
          const executedPrompt =
            executedPromptRepository.create(executedPromptData);
          await executedPromptRepository.save(executedPrompt);
        } else {
          await executedPromptRepository.update(
            { id: isExecutedPromptExist.id },
            {
              prompt: message,
              is_bard: true,
              bard_response: reply,
            }
          );
        }
      }
    } else {
      const chatGptApiKey = setting?.api_key || process.env.CHATGPT_DEFAULT_KEY;
      const configuration = new Configuration({
        apiKey: chatGptApiKey,
      });
      const openai = new OpenAIApi(configuration);

      const messages = [
        {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: "You are a helpful assistant.",
        },
        { role: ChatCompletionRequestMessageRoleEnum.User, content: message },
      ];
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      });

      // Extract the generated reply from the response
      reply = response.data.choices[0].message.content;
      if (!!company) {
        const isExecutedPromptExist = await executedPromptRepository.findOne({
          where: {
            company_id: company?.id,
            name: prompt_name,
          },
        });
        if (!isExecutedPromptExist) {
          const executedPromptData = {
            name: prompt_name,
            prompt: message,
            is_bard: false,
            is_chat_gpt: true,
            bard_response: null,
            chat_gpt_response: reply,
            company_id: company?.id,
          };
          const executedPrompt =
            executedPromptRepository.create(executedPromptData);
          await executedPromptRepository.save(executedPrompt);
        } else {
          await executedPromptRepository.update(
            { id: isExecutedPromptExist.id },
            {
              prompt: message,
              is_chat_gpt: true,
              chat_gpt_response: reply,
            }
          );
        }
      }
    }

    if (!!history) {
      const userChat = chatRepository?.create({
        message,
        history_id: history?.id,
        ...(!!req.body?.prompt_name && { prompt_name: req.body?.prompt_name }),
      });
      const botChat = chatRepository?.create({
        message: reply,
        is_bot: true,
        history_id: history?.id,
      });
      await chatRepository?.save(userChat);
      await chatRepository?.save(botChat);
      history.updatedAt = new Date();
      await historyRepository.save(history);
    }

    // Send the reply back in the API response
    res.json({ reply, success: true, history_id: history?.id });
  } catch (error) {
    res.status(500).json({
      message: "Failed to process chat message.",
      success: false,
      error: error.message,
    });
  }
};

export const chatHistoryByHistoryId = async (
  req: Request & { userId: number },
  res: Response
) => {
  try {
    const { historyId } = req.params;

    const chatHistory = await historyRepository?.findOne({
      where: { id: Number(historyId) },
      relations: ["chats"],
    });

    // Send the reply back in the API response
    res.json({
      chat_history: chatHistory,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to get chat history",
      success: false,
      error: error.message,
    });
  }
};
