import { SQ } from "./SQInterface";
export class SQUpdate
{
    public async updatePasswordByEmail(SQ: SQ, email: string, password: string)
    {
        return await SQ.User.update({ password: password }, {
            where: {
                email: email
            }
        });
    }
}