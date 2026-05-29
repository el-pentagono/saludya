import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
@ApiTags('documents')
@Controller('api/documents')
export class DocumentsController { constructor(private readonly service: DocumentsService) {} }
