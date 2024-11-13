import { Model, ModelStatic } from "@sequelize/core";
import { User } from "./SQDatabase";
import { SQ } from "./SQInterface";

export class SQInsert
{
    async insertUser(SQ: SQ, username: string, password: string, email: string)
    {
        const result = await SQ.User.create({
            username: username,
            password: password,
            email: email,
        });
        return result;
    }

    async insertStall(SQ: SQ, stallNo: number, description: string)
    {
        const result = await SQ.Stall.create({
            stallNo: stallNo,
            description: description,
        });
        return result;
    }

    async insertFeedback(SQ: SQ, feedbackType: string, feedback: string)
    {
        const result = await SQ.Feedback.create({
            feedbackType: feedbackType,
            feedback: feedback,
        });
        return result;
    }
}