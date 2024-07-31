### Overview

---

Product roadmap API modeled after the Posthog Roadmap page aims to inform users about a product’s future development by using GitHub issues and labels as medium of communication.

There will primarily be two kinds of users of the system:

- Product managers manage the tickets through GitHub Issues.
- The end-users explore the tickets through the API.

### How it works?

---

GitHub will push events to your server using Webhooks. These events include actions such as adding issues, updating issues, and adding labels.

An issue is not considered a roadmap post unless explicitly assigned the **roadmap** label and can be linked to an area through the **area** label. An area label is a label that starts with **Area: `{label-name}`** which acts as a method to categorize/group the roadmap posts.

Also,

- Once we assign an area label to an issue, it’ll be stored in the database as a roadmap post. If the label is detached, the post will stay uncategorized. Another option is to delete it, since it’ll be added later if the label is attached again.
- On area label removal, unlink it from all posts without deleting them, making them uncategorized. Again, you can decide to delete them.
- Github issue ID/number will be used as the primary key for the posts table.

### Requirements

---

- Allow searching for posts based on various criteria.
- Support multiple posts for each area.
- Display the most-voted posts.
- Display the latest posts.
- Display uncategorized posts.
- Display posts by area.
- Paginate posts along with their associated votes.
- Link posts to GitHub issues.
- Remove the post when the associated GitHub issue is unlabeled or deleted.
- Sync upvotes and downvotes of a post with the GitHub issue votes.
- Unlink an issue from an area when the area label is removed.

#### Nice to have

---

- A cron job that runs every day to look for missed issues and labels (labels should be inserted before issues)
- Send a message to Discord when a new roadmap issue is created or updated.
- Send a reminder message to Discord in the morning if a comment on a roadmap issue is unanswered.
- Build an email list and let the user subscribe to specific posts or all of them. Send them an email when a change happens.

### APIs

The HTTP endpoints are for read only; the write happens through GitHub only.

- **List posts** -implicit pagination-
  - _GET /roadmap/posts_ (normal order)
  - _GET /roadmap/posts?sort=+createdAt_ (recently added)
  - _GET /roadmap/posts?sort=+votes_ (most popular)
  - _GET /roadmap/posts?areaId=`{areaId}`_ (area posts)
  - _GET /roadmap/posts?areaId=null_ (uncategorized)
- **List areas**
  - GET /roadmap/areas

### Database Schema

<Mermaid chart={``}>
erDiagram
    %% Define the AREAS table
    AREAS {
        columnName type "constraints"
        id string "primary key"
        name short-text "unique, not null"
    }

    %% Define the POSTS table
    POSTS {
        columnName type "constraints"
        id string "primary key"
        title short-text
        vote integer
        description long-text
        issueUrl url
        areaId string "foreign key references AREAS(id)"
    }

    %% Define the relationship between AREAS and POSTS
    AREAS ||--o{ POSTS : "one area can have many posts, one post can belong to one area (optional)"
</Mermaid>
