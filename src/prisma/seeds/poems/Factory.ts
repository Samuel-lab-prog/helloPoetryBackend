import { type InsertPoem } from './InsertModel';

export function createPoemSeeds(params: { authorId: number }): InsertPoem[] {
	const { authorId } = params;

	return [
		{
			title: 'No silêncio da madrugada',
			slug: 'no-silencio-da-madrugada',
			excerpt: 'Quando o mundo dorme, meus pensamentos acordam.',
			content: `Quando o mundo dorme,
meus pensamentos acordam
e dançam sozinhos
no escuro da madrugada.`,
			authorId,
			tags: ['madrugada', 'silencio', 'pensamentos'],
			visibility: 'friends',
		},
		{
			title: 'Carta que nunca enviei',
			slug: 'carta-que-nunca-enviei',
			excerpt: 'Escrevi teu nome mil vezes e rasguei todas.',
			visibility: 'private',
			content: `Escrevi teu nome mil vezes
e rasguei todas as folhas.
Algumas palavras
não suportam o peso da realidade.`,
			authorId,
			isCommentable: false,
			tags: ['carta', 'não-enviada', 'palavras'],
		},
		{
			title: 'Poema público',
			slug: 'poema-publico',
			content: `Este poema é público,
mas nem todo mundo entende.
Algumas verdades
não precisam de plateia.`,
			authorId,
			visibility: 'public',
			status: 'published',
			moderationStatus: 'approved',
			tags: ['publico', 'verdades', 'poema'],
		},
	];
}
