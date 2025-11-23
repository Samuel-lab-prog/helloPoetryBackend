INSERT INTO poems (
    title, content, user_id, slug, moderation_status,
    visibility, status, likes_count, created_at
) VALUES
(
    'The Road Not Taken',
    'Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;',
    1,
    'the-road-not-taken',
    'clean',
    'public',
    'published',
    150,
    NOW()
),
(
    'Stopping by Woods on a Snowy Evening',
    'Whose woods these are I think I know.
His house is in the village though;
He will not see me stopping here
To watch his woods fill up with snow.',
    2,
    'stopping-by-woods-on-a-snowy-evening',
    'clean',
    'public',
    'published',
    200,
    NOW()
),
(
    'I Wandered Lonely as a Cloud',
    'I wandered lonely as a cloud
That floats on high o''er vales and hills,
When all at once I saw a crowd,
A host, of golden daffodils;
Beside the lake, beneath the trees,
Fluttering and dancing in the breeze.',
    3,
    'i-wandered-lonely-as-a-cloud',
    'clean',
    'public',
    'published',
    250,
    NOW()
);
INSERT INTO poems (
    title, content, user_id, slug, moderation_status,
    visibility, status, likes_count, created_at
) VALUES (
    'Ozymandias',
    'I met a traveller from an antique land
Who said: Two vast and trunkless legs of stone
Stand in the desert. Near them, on the sand,
Half sunk, a shattered visage lies, whose frown,
And wrinkled lip, and sneer of cold command,
Tell that its sculptor well those passions read
Which yet survive, stamped on these lifeless things,
The hand that mocked them and the heart that fed;
And on the pedestal these words appear:
"My name is Ozymandias, king of kings:
Look on my works, ye Mighty, and despair!"
Nothing beside remains. Round the decay
Of that colossal wreck, boundless and bare
The lone and level sands stretch far away.',
    1,
    'ozymandias',
    'clean',
    'public',
    'published',
    300,
    NOW()
);
INSERT INTO poems (
    title, content, user_id, slug, moderation_status,
    visibility, status, likes_count, created_at
) VALUES (
    'Daffodils',
    'I wandered lonely as a cloud
That floats on high o''er vales and hills,
When all at once I saw a crowd,
A host, of golden daffodils;
Beside the lake, beneath the trees,
Fluttering and dancing in the breeze.',
    2,
    'daffodils',
    'clean',
    'public',
    'published',
    180,
    NOW()
);
