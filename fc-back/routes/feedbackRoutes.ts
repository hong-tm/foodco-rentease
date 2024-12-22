import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const feedbackSchema = z.object({
	id: z.number().int().positive().min(1),
	happiness: z.number().int().positive().min(1).max(4),
	stall: z.number().int().positive().min(1).max(20),
	feedbackContent: z.string().min(3).max(255),
});

type Feedback = z.infer<typeof feedbackSchema>;

const createPostSchema = feedbackSchema.omit({ id: true });

const fakeFeedback: Feedback[] = [
	{
		id: 1,
		happiness: 4,
		stall: 2,
		feedbackContent: "I dont like this",
	},
	{
		id: 2,
		happiness: 2,
		stall: 5,
		feedbackContent: "This is good",
	},
	{
		id: 3,
		happiness: 3,
		stall: 13,
		feedbackContent: "This is great",
	},
	{
		id: 4,
		happiness: 4,
		stall: 20,
		feedbackContent: "I love this",
	},
];

const feedbackRoute = new Hono();

feedbackRoute.get("/", (c) => {
	return c.json({ feedback: fakeFeedback });
});

feedbackRoute.post("/", zValidator("json", createPostSchema), async (c) => {
	const feedback = await c.req.valid("json");
	fakeFeedback.push({ ...feedback, id: fakeFeedback.length + 1 });

	c.status(201);
	return c.json({ feedback });
});

feedbackRoute.get("/:id", (c) => {
	const id = Number.parseInt(c.req.param("id"));
	const feedback = fakeFeedback.find((feedback) => feedback.id === id);

	if (!feedback) {
		return c.notFound();
	}
	return c.json({ feedback });
});

feedbackRoute.delete("/:id", (c) => {
	const id = Number.parseInt(c.req.param("id"));
	const index = fakeFeedback.findIndex((feedback) => feedback.id === id);

	if (index === -1) {
		return c.notFound();
	}

	fakeFeedback.splice(index, 1);
	return c.json({ message: "Feedback deleted" });
});

feedbackRoute.put("/:id", zValidator("json", createPostSchema), async (c) => {
	const id = Number.parseInt(c.req.param("id"));
	const index = fakeFeedback.findIndex((feedback) => feedback.id === id);

	if (index === -1) {
		return c.notFound();
	}

	const feedback = await c.req.valid("json");
	fakeFeedback[index] = { ...feedback, id };

	return c.json({ feedback: fakeFeedback[index] });
});

export default feedbackRoute;
