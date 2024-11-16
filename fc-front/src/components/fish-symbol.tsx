const FishSymbolIcon = () => {
	return (
		<div className="elect-none p-2 rounded-md transition-colors">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="url(#customGradient)"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<defs>
					<linearGradient id="customGradient" x1="0%" y1="0%" x2="100%" y2="0%">
						<stop offset="0%" stopColor="#b802d0" />
						<stop offset="20%" stopColor="#e62652" />
						<stop offset="40%" stopColor="#eb6f02" />
						<stop offset="60%" stopColor="#e59a02" />
						<stop offset="80%" stopColor="#6ba702" />
						<stop offset="100%" stopColor="#026bc2" />
					</linearGradient>
				</defs>
				<path d="M2 16s9-15 20-4C11 23 2 8 2 8" />
			</svg>
		</div>
	);
};

export { FishSymbolIcon };
