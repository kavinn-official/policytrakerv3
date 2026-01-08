# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/28bf2bab-5f65-4122-bd82-a62cb20f9a6d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/28bf2bab-5f65-4122-bd82-a62cb20f9a6d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

### Netlify Deployment

This project is configured for Netlify deployment. The `netlify.toml` file contains the build configuration.

#### Environment Variables

You must configure the following environment variables in your Netlify dashboard (Site Settings → Environment Variables):

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key | ✅ Yes |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | ✅ Yes |

#### Steps to Configure Netlify Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Navigate to **Site settings** → **Environment variables**
4. Click **Add a variable** for each of the required variables above
5. Enter the variable name and value
6. Save and redeploy

#### Build Configuration

The project uses the following build settings (already configured in `netlify.toml`):

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 20

An `.npmrc` file is included to handle peer dependency conflicts with `legacy-peer-deps=true`.

### Lovable Deployment

Simply open [Lovable](https://lovable.dev/projects/28bf2bab-5f65-4122-bd82-a62cb20f9a6d) and click on Share → Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
