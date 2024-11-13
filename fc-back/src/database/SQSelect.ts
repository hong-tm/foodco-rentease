import { Op } from "@sequelize/core";
import { SQ } from "./SQInterface";

export class SQSelect
{
    async selectUserID(SQ: SQ, email: string)
    {
        const user = await SQ.User.findOne({
            attributes: ['id'],
            where: {
                email: email
            }
        });
        return user;
    }

    async selectEmailPassword(SQ: SQ, email: string, password: string)
    {
        const user = await SQ.User.findOne({
            where: {
                [Op.and]:
                    [
                        { email: email },
                        { password: password }
                    ]
            }
        });
        return user;
    }

    async selectStall(SQ: SQ, stallNo: number)
    {
        const stall = await SQ.Stall.findOne({
            where: {
                stallNo: stallNo
            }
        });
        return stall;
    }
}