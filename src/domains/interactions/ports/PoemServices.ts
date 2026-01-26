import type { PoemVisibility } from '@SharedKernel/Enums';

export interface PoemsContractForInteractions {
	getPoemInteractionInfo(poemId: number): Promise<{
		exists: boolean;
		authorId: number | null;
		visibility: PoemVisibility | null;
	}>;
}
