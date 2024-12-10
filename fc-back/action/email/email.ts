import { Resend } from "resend";
import * as dotenv from "dotenv";
dotenv.config();

export async function sendEmail({
	to,
	subject,
	text,
}: {
	to: string;
	subject: string;
	text: string;
}) {
	const resend: any = new Resend(process.env.RESEND_API);

	if (!process.env.RESEND_API) {
		throw new Error("RESEND_API is not set");
	}

	const { data, error } = await resend.emails.send({
		from: `tech@nullsoul.com`,
		to: to,
		subject: subject,
		text: text,
	});

	if (error) {
		console.log(error, "400");
	}

	return data;
}
