import fastify from "fastify";
import { serializerCompiler, validatorCompiler} from "fastify-type-provider-zod";
import { createEvent } from "./routes/create-event";
import { registerForEvents } from "./routes/register-for-events";
import { getEvent } from "./routes/get-event";
import { getAttendeeBadge } from "./routes/get-attendee-badge";

const app = fastify()

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createEvent)
app.register(registerForEvents)
app.register(getEvent)
app.register(getAttendeeBadge)

app.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running')
})