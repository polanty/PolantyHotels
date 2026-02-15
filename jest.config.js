export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/FrontEnd/my-react-app/",
    "/src/Controller/authentication/",
  ],
};
