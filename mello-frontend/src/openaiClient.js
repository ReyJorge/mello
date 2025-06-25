import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: "TVŮJ_OPENAI_API_KEY", // nahraď vlastním klíčem
  dangerouslyAllowBrowser: true, // nutné pro frontendové použití
});

export default openai;
