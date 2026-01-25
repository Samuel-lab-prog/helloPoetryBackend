import type { PoemVisibility } from '@SharedKernel/Enums';

export interface PoemsContract {
	getPoemInteractionInfo(poemId: number): Promise<{
		exists: boolean;
		authorId: number | null;
		visibility: PoemVisibility | null;
	}>;
}
