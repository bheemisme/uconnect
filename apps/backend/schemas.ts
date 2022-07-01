import {z} from 'zod'

export const message_schema = z.object({
    'timestamp': z.string(),
    'owner': z.string(),
    'message': z.string(),
    'mid': z.string(),
    'tid': z.string()
})

export const thread_schema = z.object({
    'tid': z.string(),
    'name': z.string(),
    'messages': z.array(message_schema).optional(),
    'from': z.string().email(),
    'fromtype': z.enum(['school','user']),
    'to': z.string().email(),
    'allocated': z.string().email(),
    'terminated': z.boolean(),
    'allocated_type': z.enum(['school','worker'])
})

export const token_schema = z.object({
    type: z.enum(['token']),
    token_type: z.enum(['worker','user','school']),
    token_email: z.string().email(),
    token_semail: z.string().email().optional(),
    TTL: z.number(),
    token: z.string()
})

export const stateless_authorizer_schema = z.object({
    type: z.enum(['worker','school','user']),
    email: z.string().email(),
    semail: z.string().email().optional()
})

export const statefull_authorizer_schema = z.object({
    'sk': z.string(),
    'principalId': z.enum(['school','worker','user']),
    'pk': z.string(),
    'type': z.enum(['school','worker','user'])
})

export const school_schema = z.object({
    'email': z.string().email(),
    'type': z.enum(['school']),
    'name': z.string(),
    'worker_limit': z.number(),
    'thread_limit': z.number()
})

export const worker_schema = z.object({
    'email': z.string().email(),
    'semail': z.string().email(),
    'type': z.enum(['worker'])
})


export const user_schema = z.object({
    'email': z.string().email(),
    'type': z.enum(['user']),
    'name': z.string(),
    'thread_limit': z.number()
})

export const post_auth_worker_schema = z.object({
    'email': z.string(),
    'custom:semail': z.string(),
    'custom:type': z.enum(['worker']),
    'email_verified': z.enum(['true']),
    'cognito:user_status': z.enum(['CONFIRMED','FORCE_CHANGE_PASSWORD'])
})
