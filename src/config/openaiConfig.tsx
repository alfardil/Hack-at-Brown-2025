import { OpenAI } from "openai";

const chatClient = new OpenAI({
  apiKey:
    "EkYQmAEbmG5s7ojsYbo8IkM2cNgRosNtNNxygLebYo0BbnZgAxZUJQQJ99AKACYeBjFXJ3w3AAABACOGtOqK",
  baseURL: `https://adonis.openai.azure.com/openai/deployments/gpt-4o-mini`,
  dangerouslyAllowBrowser: true,
  defaultQuery: { "api-version": "2024-08-01-preview" },
  defaultHeaders: {
    "api-key":
      "EkYQmAEbmG5s7ojsYbo8IkM2cNgRosNtNNxygLebYo0BbnZgAxZUJQQJ99AKACYeBjFXJ3w3AAABACOGtOqK",
  },
});

export { chatClient };
