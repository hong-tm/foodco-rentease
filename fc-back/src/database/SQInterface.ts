import Sequelize, { Model, ModelStatic } from "@sequelize/core";
import { User } from "./SQDatabase";
import { Stall } from "./SQDatabase";
import { Notification } from "./SQDatabase";
import { Feedback } from "./SQDatabase";

export interface SQ
{
    sequelize: Sequelize;
    User: typeof User;
    Stall: typeof Stall;
    Notification: typeof Notification;
    Feedback: typeof Feedback;
}