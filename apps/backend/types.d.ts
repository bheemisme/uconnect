import {z} from 'zod'
import * as schemas from './schemas'

export type Thread = z.infer<typeof schemas.thread_schema>
export type Message = z.infer<typeof schemas.message_schema>
