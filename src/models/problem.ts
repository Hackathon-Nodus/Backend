import mongoose from "mongoose";

const problemSchema = new mongoose.Schema(
  {
    // BASIC INFO (USER INPUT)
    title: { type: String, required: true },
    desc: { type: String, required: true },
    category: { type: String, default: "General" },
    tags: [{ type: String }],

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    status: {
      type: String,
      enum: ["open", "hiring", "closed"],
      default: "open",
    },

    // AI OUTPUT
    refinedTitle: { type: String },
    refinedDesc: { type: String },

    aiEnhanced: { type: Boolean, default: false },

    aiMetadata: {
      suggestedTags: [{ type: String }],
      keyPoints: [{ type: String }],
      suggestedBudget: Number,
    },

    // RELATIONS
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hiredSolution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solution",
    },

    matchedSolvers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    
    // METRICS
    
    totalVotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

problemSchema.index({ status: 1, category: 1 });
problemSchema.index({ tags: 1 });
problemSchema.index({ createdBy: 1 });

export default mongoose.model("Problem", problemSchema);