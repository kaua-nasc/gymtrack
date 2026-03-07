import { ApiProperty } from '@nestjs/swagger';

export class WeeklyActivityResponseDto {
  @ApiProperty({ description: 'Monday training status', example: true })
  mon: boolean;

  @ApiProperty({ description: 'Tuesday training status', example: false })
  tue: boolean;

  @ApiProperty({ description: 'Wednesday training status', example: true })
  wed: boolean;

  @ApiProperty({ description: 'Thursday training status', example: false })
  thu: boolean;

  @ApiProperty({ description: 'Friday training status', example: true })
  fri: boolean;

  @ApiProperty({ description: 'Saturday training status', example: false })
  sat: boolean;

  @ApiProperty({ description: 'Sunday training status', example: false })
  sun: boolean;
}
