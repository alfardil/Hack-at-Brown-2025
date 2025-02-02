export const debateQuestions = [
  "Should homework be banned?",
  "Should school start later in the morning?",
  "Should students wear uniforms?",
  "Should recess be longer?",
  "Should kids have their own phones?",
  "Should video games be allowed on school days?",
  "Should kids choose their own bedtime?",
  "Should candy be allowed in school?",
  "Should every day be pizza day in the cafeteria?"
];

export const getRandomQuestion = (): string => {
  const randomIndex = Math.floor(Math.random() * debateQuestions.length);
  return debateQuestions[randomIndex];
}; 