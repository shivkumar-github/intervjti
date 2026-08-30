const mongoose = require('mongoose');

const experienceChunkSchema = new mongoose.Schema(
    {
        experienceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Experience',
            required: true,
            index: true
        },

        chunkIndex: {
            type: Number,
            required: true
        },

        text: {
            type: String,
            required: true
        },

        companyName: {
            type: String,
            required: true,
            index: true
        },

        year: {
            type: String,
            index: true
        },

        experienceType: {
            type: String,
            index: true
        },

        studentName: {
            type: String
        },

        source: {
            fileId: {
                type: String,
                index: true
            },

            fileName: {
                type: String
            },

            originalPath: {
                type: String
            }
        },

        embedding: {
            type: [Number],
            select: false
        }
    },
    {
        timestamps: true
    }
);

experienceChunkSchema.index(
    {
        experienceId: 1,
        chunkIndex: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model(
    'ExperienceChunk',
    experienceChunkSchema
);