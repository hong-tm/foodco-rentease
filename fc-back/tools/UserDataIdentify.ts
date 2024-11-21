import { AES_256_GCM } from "../cryptography/AES-256-GCM.js"

export interface UserDataFromClient
{
    BFENC: {
        username: string,
        email: string,
        userRole: string,
        imageUrl: string
        phoneNumber: string,
        city: string,
        postCode: number,
        state: string
    }
    AFENC: {
        encryptedData: BufferType,
        iv: BufferType,
        tag: BufferType
    }
}

interface BufferType
{
    type: string,
    data: number[]
}


export class UserDataIdentify
{
    aes256gcm = new AES_256_GCM();
    /**
     * 使用用户传回的数据和加密数据，解密然后比较是否相等，相等则表示用户身份验证通过
     * @param userData 
     * @returns 
     */
    public async identifyIUser(userData: UserDataFromClient)
    {
        const encryptedData = Buffer.from(userData.AFENC.encryptedData.data);
        const iv = Buffer.from(userData.AFENC.iv.data);
        const tag = Buffer.from(userData.AFENC.tag.data);

        const decryptedData = await this.aes256gcm.decrypt(encryptedData, iv, tag, userData.BFENC.email);
        return decryptedData === JSON.stringify(userData.BFENC);

    }

}