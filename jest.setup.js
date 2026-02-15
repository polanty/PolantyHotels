// Mock mongoose to prevent initialization errors in tests
// This is called before all tests run
jest.mock("mongoose", () => {
  // Create a mock schema instance
  const mockSchemaInstance = {
    pre: jest.fn().mockReturnThis(),
    post: jest.fn().mockReturnThis(),
    virtual: jest.fn(function () {
      return {
        get: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
      };
    }),
    index: jest.fn().mockReturnThis(),
    methods: {},
    path: jest.fn(),
  };

  // Mock Schema constructor
  const SchemaConstructor = jest.fn(() => mockSchemaInstance);

  // Add Types to Schema
  SchemaConstructor.Types = {
    ObjectId: jest.fn(),
    String: String,
    Number: Number,
    Boolean: Boolean,
    Date: Date,
    Array: Array,
  };

  // Mock model function
  const mockModel = jest.fn((name, schema) => {
    return jest.fn(function (data) {
      return {
        ...data,
        save: jest.fn().mockResolvedValue(this),
      };
    });
  });

  // Return the mongoose mock
  return {
    Schema: SchemaConstructor,
    model: mockModel,
    connect: jest.fn().mockResolvedValue({}),
    connection: {
      close: jest.fn(),
    },
  };
});
