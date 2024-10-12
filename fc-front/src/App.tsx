import { useState } from "react";
import "./App.scss";
import "./index.scss";
import { AvatarUser } from "./components/avatar-user";
import { Button } from "./components/ui/button";
import { DatePickerWithRange } from "./components/data-picker";
import { Toaster, toast } from "sonner";

function App() {
	const [count, setCount] = useState(0);

	return (
		<>
			<div>
				<Button
					variant="secondary"
					onClick={() => setCount((count) => count + 1)}
				>
					count is {count}
				</Button>

				<AvatarUser />
			</div>
			<div>
				<DatePickerWithRange />
			</div>

			<div>
				<Toaster richColors />
				<Button
					onClick={() => toast.info("My first toast success in 0.1 second !")}
				>
					Give me a toast
				</Button>
			</div>
		</>
	);
}

export default App;
