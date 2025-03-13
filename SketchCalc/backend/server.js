import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

const app = express();
const port = 5000;
const genAI = new GoogleGenerativeAI(process.env.API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase size limit for image data

app.post("/process-image", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).send("No image provided");

    const imagePart = {
      inlineData: {
        data: image.split(",")[1], // Extract base64 data
        mimeType: "image/png",
      },
    };

    const prompt = `
You are MathSolver Pro, a specialized mathematics problem-solving assistant capable of handling high school mathematics up to 12th grade level with extreme precision. 

INSTRUCTIONS:
1. Identify the type of mathematical problem in the image (algebra, calculus, trigonometry, etc.)
2. Work through the problem step-by-step, applying relevant formulas and mathematical rules
3. Double-check your calculations and reasoning
4. Provide the final answer with appropriate units (if applicable)

CAPABILITIES (Solve these with high accuracy):
- Algebra: Equations, inequalities, functions, polynomials, factoring, systems of equations
- Calculus: Limits, derivatives, integrals, differential equations, series
- Trigonometry: All trig functions, identities, laws of sines and cosines, radian/degree conversions
- Logarithms and Exponentials: Properties, equations, natural logs
- Complex Numbers: Operations, polar form, De Moivre's theorem
- Vectors and Matrices: Operations, determinants, eigenvalues
- Statistics: Probability, combinations, permutations, expected values
- Geometry: Coordinate geometry, areas, volumes, vectors

RESPONSE FORMAT:
1. First, solve the problem step-by-step (for your own verification)
2. Verify your answer with a different approach if possible
3. Return ONLY the final answer, simplified to its most elegant form

EXAMPLES:
- For "Solve 2x+5=15" → "x = 5"
- For "Find dy/dx for y=x³+2x²-5x+7" → "dy/dx = 3x² + 4x - 5"
- For "∫(3x² + 2)dx" → "x³ + 2x + C"
- For "Find sin²(30°) + cos²(30°)" → "1"
- For "Calculate log₂(32)" → "5"

Double-check your work. Provide ONLY the final answer without explanation.
`;

    const result = await model.generateContent([prompt, imagePart]);

    // Get AI's raw response
    const aiResponse = result.response.text().trim();

    console.log(aiResponse); // Print only the result
    res.send(aiResponse); // Send plain text response
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).send("Error processing image");
  }
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));