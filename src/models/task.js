import mongoose from "mongoose";

const tasksSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId, //mongoose定義的
        required: true,
        ref: 'User' //可以引用其他model
    }
}, {
    timestamps :true
})


const Task = mongoose.model('Task', tasksSchema);

export default Task;