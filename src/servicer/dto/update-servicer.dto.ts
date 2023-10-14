import { PartialType } from '@nestjs/swagger';
import { CreateServicerDto } from './create-servicer.dto';

export class UpdateServicerDto extends PartialType(CreateServicerDto) {}
