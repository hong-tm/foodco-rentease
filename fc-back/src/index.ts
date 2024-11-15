import express, { Request, Response } from 'express';
// import { Login } from './api/login/Login';
import { SQDatabase } from './database/SQDatabase';
import { FileOperation } from './fileoperation/FileOperation';
import cors from 'cors';
import path from 'path';
import { SQ } from './database/SQInterface';
// import { Register } from './api/register/Register';
// import { GetImages } from './api/getImages/GetImages';
// import { UpdatePassword } from './api/updatePassword/UpdatePassword';
import { get } from 'http';
// import { AddStall } from './api/addStall/AddStall';
// import { AddFeedback } from './api/addFeedback/AddFeedback';


class app
{
    fileOperation = new FileOperation();
    app = express();
    public async start()
    {

        await this.initFile();

        const config = await this.fileOperation.getConfig();
        if (!config)
        {
            console.log('Config file not found');
            return;
        }
        const port = config.server.port;
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());

        const sqDatabase = new SQDatabase(config);
        const tables = await sqDatabase.createTable();
        const SQ: SQ = {
            sequelize: sqDatabase.sequelize,
            User: tables.user,
            Notification: tables.notification,
            Feedback: tables.feedback,
            Stall: tables.Stall,
        }

        // const login = new Login();
        // const register = new Register();
        // const getImages = new GetImages();
        // const updatePassword = new UpdatePassword();
        // const addStall = new AddStall();
        // const addFeedback = new AddFeedback();

        // const router = [
        //     login.getRouter(SQ),
        //     register.getRouter(SQ),
        //     getImages.getImagesRouter(),
        //     getImages.getAvatarRouter(),
        //     getImages.getIconRouter(),
        //     updatePassword.getRouter(SQ),
        //     addStall.getRouter(SQ),
        //     addFeedback.getRouter(SQ),
        // ]

        // this.app.use('/', router);

        this.app.get('/', (req: Request, res: Response) =>
        {
            res.send('Hello, TypeScript with Express!');
        });

        this.app.listen(port, () =>
        {
            console.log(`Server is running on http://localhost:${ port }`);
        });

    }

    public async initFile()
    {
        await this.fileOperation.createDefaultConfig();
        await this.fileOperation.createDefaultImages();
        await this.fileOperation.createDefaultAvatar();
        await this.fileOperation.createDefaultIcon();

    }
}


new app().start();





