# Content decisions

Wording that the owner has decided. It is binding for the content modules.

## 2026-09-28

The old pages were inconsistent in three places. The owner settled them as follows.

| Where | Old wording | Decided wording |
| --- | --- | --- |
| English biography, employer | China Academy of Machinery Shanxi Electromechanical Research Institute Company Limited | China Academy of Machinery **Science and Technology Group** Shanxi Electromechanical Research Institute Company Limited (as in the Experience entry) |
| Simplified Chinese biography, honours class | 一级荣誉 | 一等荣誉 (as in the Education entry) |
| Traditional Chinese biography, honours class | 一級榮譽 | 一等榮譽 (as in the Education entry) |
| Traditional Chinese, contact label | 電子郵箱 | 電郵 |
| Traditional Chinese, all occurrences | 澳大利亞 | 澳洲 |
| Traditional Chinese, all occurrences | 新南威爾士 | 新南威爾斯 |
| Traditional Chinese, state name | 南澳大利亞州 | 南澳洲 (so the phrase reads 澳洲南澳洲阿德萊德) |

Not changed: the Chinese employer name 中国机械总院集团 / 中國機械總院集團, which was
already the same in the biography and the Experience entry.

The same changes were made on the same day in the old static pages in the folder beside
the app, and the last-updated date was set to 2026-09-28 in both the static pages and
`src/content/site.ts`. The static pages and the content modules therefore agree word for
word again; a comparison between them should find no difference in wording or dates.

### Interface labels, approved the same day

The new site needed six labels that the old site never had. The owner approved these.
Only the first is visible; the others are accessible names, heard with the role of the
element, so none of them contains a role word such as "navigation".

| Label | Field | English | 繁體 | 简体 |
| --- | --- | --- | --- | --- |
| Link to the home page in the header | `common.nav.home` | Home | 主頁 | 首页 |
| Name of the page navigation | `common.nav.label` | Site | 網站 | 网站 |
| Name of the contact block | `home.contact.label` | Contact details | 聯絡資料 | 联系方式 |
| Name of the breadcrumb | `keys.head.breadcrumbLabel` | Breadcrumb | 瀏覽路徑 | 面包屑 |
| Name of the links to the sections of the key page | `keys.head.sectionsLabel` | On this page | 本頁目錄 | 本页目录 |

The owner chose 主頁 for Traditional Chinese, so "back to home" reads 返回主頁 there
(it was 返回首頁), in the app and in the old static pages. Simplified Chinese keeps
首页 and 返回首页.

The last-updated date of the app was set to 2026-09-29 (owner's decision, the same day),
after the blog section was added to the home page. The old static pages keep 2026-09-28,
so a comparison now finds this one difference in dates.

The blog section of the home page (2026-09-29) has two visible labels. Both repeat wording
that the blog already uses: the heading is the name of the blog in the header, the link is
the back link of a post.

| Label | Field | English | 繁體 | 简体 |
| --- | --- | --- | --- | --- |
| Heading of the blog section | `home.blog.title` | Blog | 網誌 | 博客 |
| Link to the list of all posts | `home.blog.allPosts` | All posts | 全部文章 | 全部文章 |

Deliberately left without a label: the text of the SSH key (`keys.ssh.keyAriaLabel`). A
label would make the line a keyboard stop, and the line wraps and never scrolls, so the
stop would do nothing.

## Earlier decisions that still hold

- No mainland-China (+86) phone number anywhere.
- No WeChat QR code. The WeChat ID appears as plain text on the Simplified Chinese home
  page only.
- Profile link order: ORCID, Google Scholar, CityUHK Scholars, GitHub, LinkedIn, Keys.
- Home pages show no key fingerprints or other key data.
- Language switch order: English / 繁體 / 简体.
