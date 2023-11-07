import * as mongoose from 'mongoose';

export const MessagingSchema = new mongoose.Schema(
  {
    // connectionId: {
    //   type: String,
    //   required: true,
    // },
    // userId: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'USER_MODEL',
    //   required: true,
    // },
    // servicerId: {
    //   type: mongoose.Schema.ObjectId,
    //   ref: 'SERVICER_MODEL',
    //   required: true,
    // },
    users: [{ type: mongoose.Schema.Types.ObjectId }],
    userRead: { type: Boolean, default: false },
    professionalRead: { type: Boolean, default: false },
    messages: [
      {
        text: { type: String, required: true },
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'messages.senderType',
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'messages.receiverType',
        },
        senderType: {
          type: String,
          enum: ['User', 'Servicer'],
          required: true,
        },
        receiverType: {
          type: String,
          enum: ['User', 'Servicer'],
          required: true,
        },
        time: { type: Date, required: true },
      },
    ],
  },
  { timestamps: true },
);
