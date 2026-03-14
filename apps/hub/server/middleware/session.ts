export default defineEventHandler(async (event) => {
  try {
    const session = await getUserSession(event);
    event.context.userSession = session;
  } catch {
    event.context.userSession = null;
  }
});
