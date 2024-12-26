// src/context/UserContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

// Define the user data type
export interface UserData {
	name: string;
	role: string;
	email: string;
	id: string;
	verified: boolean;
	phone: string;
	avatar: string;
}

type UserContextType = {
	user: UserData | null;
	setUser: (user: UserData) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<UserData | null>(null);

	return (
		<UserContext.Provider value={{ user, setUser }}>
			{children}
		</UserContext.Provider>
	);
};

export const useUser = (): UserContextType => {
	const context = useContext(UserContext);
	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
