import mongoose from "mongoose"

const TodoSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        }
    },
    {
        isComplete: {
            type: Boolean,
            required: true,
            default: false

        }
    },
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

const Todo = mongoose.model("Todo", TodoSchema);

export default Todo;