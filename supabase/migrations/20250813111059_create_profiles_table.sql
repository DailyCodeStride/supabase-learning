-- Create profiles table
CREATE TABLE IF NOT EXISTS public.test (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	username text NOT NULL,
	email text NOT NULL UNIQUE,
	full_name text,
	website text,
	created_at timestamptz DEFAULT now()
);

-- Insert sample records (only if they don't already exist)
INSERT INTO public.test (username, email, full_name, website)
VALUES
	('alice', 'alice@example.com', 'Alice Anderson', 'https://alice.dev'),
	('bob', 'bob@example.com', 'Bob Brown', 'https://bob.dev'),
	('carol', 'carol@example.com', 'Carol Clark', 'https://carol.dev')
ON CONFLICT (email) DO NOTHING;
