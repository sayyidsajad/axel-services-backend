import { IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class PaymentVerificationDto {
  @IsNotEmpty()
  @IsObject()
  res: { razorpay_payment_id: string };

  @IsNotEmpty()
  @IsObject()
  inserted: {
    message: string;
    inserted: {
      date: string;
      time: string;
      bookingId: string;
      user: string;
      service: string;
      approvalStatus: string;
      paymentStatus: string;
      total: number;
      _id: string;
      createdAt: string;
      updatedAt: string;
      __v: number;
    };
    reducedAmt: number;
  };

  @IsOptional()
  userid: string | undefined;
}
