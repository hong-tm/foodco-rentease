import { useState, useEffect } from "react";
import { Blurhash } from "react-blurhash";

interface BlurhashComponentProps {
	imageUrl: string;
	width?: number;
	height?: number;
}

const BlurhashComponent = ({
	imageUrl,
	width = 400,
	height = 300,
}: BlurhashComponentProps) => {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [blurhash, setBlurhash] = useState<string>(
		"LEHV6nWB2yk8pyo0adR*.7kCMdnj"
	);

	useEffect(() => {
		const img = new Image();
		img.onload = () => {
			setImageLoaded(true);
		};
		img.src = imageUrl;

		// In a production environment, you would want to generate the blurhash on the server
		// and pass it as a prop, rather than using a static placeholder
	}, [imageUrl]);

	setBlurhash(imageUrl);

	return (
		<div style={{ position: "relative", width, height }}>
			{!imageLoaded && (
				<div
					style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
				>
					<Blurhash
						hash={blurhash}
						width={width}
						height={height}
						resolutionX={32}
						resolutionY={32}
						punch={1}
					/>
				</div>
			)}
			<img
				src={imageUrl}
				alt="Content"
				style={{
					display: imageLoaded ? "block" : "none",
					width: "100%",
					height: "100%",
					objectFit: "cover",
				}}
			/>
		</div>
	);
};

export default BlurhashComponent;
