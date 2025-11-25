import slugify from "slugify";
import { deletePoem, insertPoem, selectPoemById, selectPoemsByUserId, updatePoemVisibility } from "./models.ts";
import { mapFullPoemToPoem, type FullPoem, type NewPoem, type Poem} from "./types.ts";
import { AppError } from "../utils/AppError.ts";

export async function registerPoem(body: NewPoem, userId: number): Promise<Pick<Poem, 'id'>> {
  /* const tags = body.tags ?? [];
  const visibility = body.visibility ?? 'public'; */ // Need to implement tags and visibility later
  const slug = slugify(body.title, { lower: true, strict: true });

  delete body.tags;
  delete body.visibility;

  return await insertPoem({
    ...body,
    userId,
    slug
});
}

export async function getPoemsByUserId(userId: number): Promise<Poem[]> {
  const poems = await selectPoemsByUserId(userId);
  return poems.map((poem) => mapFullPoemToPoem(poem));
}


function ensurePoemExists(poem: FullPoem | null): void {
  if (!poem) {
    throw new AppError({
      statusCode: 404,
      errorMessages: ['Poem not found'],
    });
  }
}
function ensurePoemIsNotDeleted(poem: FullPoem | null): void {
  if (poem?.deletedAt) {
    throw new AppError({
      statusCode: 410,
      errorMessages: ['Poem has been deleted'],
    });
  }
}

function ensurePoemBelongsToUser(poem: FullPoem, userId: number): void {
  if (poem.userId !== userId) {
    throw new AppError({
      statusCode: 403,
      errorMessages: ['Poem does not belong to user'],
    });
  }
}

export async function getUserPoems(userId: number): Promise<Poem[]> {
  const poems = await selectPoemsByUserId(userId);
  const filteredPoems = poems.filter(poem => !poem.deletedAt);
  return filteredPoems.map(mapFullPoemToPoem);
}

export async function getUserPoemById(userId: number, poemId: number): Promise<Poem> {
  const poem = await selectPoemById(poemId);
  ensurePoemExists(poem);
  ensurePoemIsNotDeleted(poem);
  ensurePoemBelongsToUser(poem!, userId);
  return mapFullPoemToPoem(poem!);
}

export async function setUserPoemVisibility(
  userId: number,
  poemId: number,
  visibility: 'public' | 'private' | 'unlisted'
): Promise<Poem> {
  const poem = await selectPoemById(poemId);
  ensurePoemExists(poem);
  ensurePoemIsNotDeleted(poem);
  ensurePoemBelongsToUser(poem!, userId);

  const updatedPoem = await updatePoemVisibility(poemId, visibility);
  return mapFullPoemToPoem(updatedPoem!);
}

export async function deleteUserPoem(userId: number, poemId: number): Promise<Poem> {
  const poem = await selectPoemById(poemId);
  ensurePoemExists(poem);
  ensurePoemIsNotDeleted(poem);
  ensurePoemBelongsToUser(poem!, userId);
  const deletedPoem = await deletePoem(poemId);
  return mapFullPoemToPoem(deletedPoem!);
}