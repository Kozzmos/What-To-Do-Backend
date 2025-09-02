const request = require("supertest");
const app = require("/app"); // express app’in

describe("Todos API", () => {

    let todoId;

    // CREATE todo
    it("should create a new todo", async () => {
        const res = await request(app)
            .post("/api/todos")
            .send({
                list_id: 1,
                text: "Unit Test Task",
                status: "New",
                active: true,
                due_date: null,
                tags: []
            });
        expect(res.statusCode).toEqual(201);
        expect(res.body.text).toBe("Unit Test Task");
        todoId = res.body.id;
    });

    // UPDATE todo
    it("should update todo status", async () => {
        const res = await request(app)
            .put(`/api/todos/${todoId}`)
            .send({ status: "Completed" });
        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe("Completed");
    });

    // Optional: DELETE todo
    it("should delete the todo", async () => {
        const res = await request(app)
            .delete(`/api/todos/${todoId}`);
        expect(res.statusCode).toEqual(200);
    });
});
