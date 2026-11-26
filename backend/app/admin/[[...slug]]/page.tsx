import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PlaceholderWorkspace } from "@/components/admin/PlaceholderWorkspace";
import { TopperWorkspace } from "@/components/admin/toppers/TopperWorkspace";
import { NoticeWorkspace } from "@/components/admin/notices/NoticeWorkspace";
import { ContactWorkspace } from "@/components/admin/contact/ContactWorkspace";
import { NavigationWorkspace } from "@/components/admin/navigation/NavigationWorkspace";
import { HomepageWorkspace } from "@/components/admin/homepage/HomepageWorkspace";
import { AboutLeadershipWorkspace } from "@/components/admin/about/AboutLeadershipWorkspace";
import { FacultyWorkspace } from "@/components/admin/faculty/FacultyWorkspace";
import { GalleryWorkspace } from "@/components/admin/gallery/GalleryWorkspace";
import { EventsWorkspace } from "@/components/admin/events/EventsWorkspace";
import { DownloadWorkspace } from "@/components/admin/downloads/DownloadWorkspace";
import { DisclosureWorkspace } from "@/components/admin/disclosure/DisclosureWorkspace";
import { FacilityWorkspace } from "@/components/admin/facilities/FacilityWorkspace";
import { AdmissionsWorkspace } from "@/components/admin/admissions/AdmissionsWorkspace";
import { OnlineAdmissionDeskWorkspace } from "@/components/admin/admissions/OnlineAdmissionDeskWorkspace";
import type { ApplicationStatusType } from "@/lib/validation/online-admissions";
import { AcademicsWorkspace } from "@/components/admin/academics/AcademicsWorkspace";
import { ActivitiesWorkspace } from "@/components/admin/activities/ActivitiesWorkspace";
import { InstructionsWorkspace } from "@/components/admin/instructions/InstructionsWorkspace";
import { AlumniWorkspace } from "@/components/admin/alumni/AlumniWorkspace";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PublicReferenceLink } from "@/components/ui/PublicReferenceLink";
import { getAdminRedirect, getAdminWorkspace } from "@/lib/admin-navigation";
import { requireRole, requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";

interface AdminWorkspacePageProps {
  params: Promise<{ slug?: string[] }>;
}

export async function generateMetadata({
  params,
}: AdminWorkspacePageProps): Promise<Metadata> {
  const { slug = [] } = await params;
  const href = slug.length ? `/admin/${slug.join("/")}` : "/admin";
  const redirectTarget = getAdminRedirect(href);
  const targetHref = redirectTarget ?? href;
  const workspace = getAdminWorkspace(targetHref);

  if (!workspace) {
    return {
      title: "Workspace Not Found",
    };
  }

  return {
    title: workspace.title,
  };
}

export default async function AdminWorkspacePage({
  params,
}: AdminWorkspacePageProps) {
  const { slug = [] } = await params;
  const href = slug.length ? `/admin/${slug.join("/")}` : "/admin";

  // Defense-in-depth: enforce base authentication at page level
  await requireUser(href);

  const redirectTarget = getAdminRedirect(href);
  if (redirectTarget) {
    redirect(redirectTarget);
  }

  const workspace = getAdminWorkspace(href);

  if (!workspace) notFound();

  // Specialization: /admin/academics/results renders interactive BoardResultTopper workspace
  if (href === "/admin/academics/results") {
    // Restricted strictly to SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"], href);

    const toppers = await prisma.boardResultTopper.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { academicYear: "desc" },
        { scorePercent: "desc" },
        { id: "asc" },
      ],
    });

    const serializedToppers = toppers.map((topper) => {
      // Explicitly omit internal photoStorageKey from serialized client props
      const { photoStorageKey: _omittedKey, ...rest } = topper;
      void _omittedKey;
      return {
        ...rest,
        scorePercent: Number(topper.scorePercent),
        createdAt: topper.createdAt.toISOString(),
        updatedAt: topper.updatedAt.toISOString(),
      };
    });

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <TopperWorkspace toppers={serializedToppers} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/academics and /admin/academics/academic-system render AcademicsWorkspace
  if (href === "/admin/academics" || href === "/admin/academics/academic-system") {
    // Restricted strictly to SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"], href);

    const [overview, wings, streams, rules] = await Promise.all([
      prisma.academicOverview.findUnique({
        where: { id: "default" },
      }),
      prisma.academicWing.findMany({
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      }),
      prisma.academicStream.findMany({
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      }),
      prisma.academicAssessmentRule.findMany({
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      }),
    ]);

    const serializedOverview = overview
      ? {
          ...overview,
          createdAt: overview.createdAt.toISOString(),
          updatedAt: overview.updatedAt.toISOString(),
        }
      : null;

    const serializedWings = wings.map((w) => ({
      ...w,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    }));

    const serializedStreams = streams.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    const serializedRules = rules.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    const initialTab = href === "/admin/academics/academic-system" ? "rules" : "wings";

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <AcademicsWorkspace
            overview={serializedOverview}
            wings={serializedWings}
            streams={serializedStreams}
            rules={serializedRules}
            initialTab={initialTab}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/academics/faculty renders interactive FacultyWorkspace
  if (href === "/admin/academics/faculty") {
    // Restricted strictly to SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"], href);

    const faculty = await prisma.facultyMember.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    const serializedFaculty = faculty.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <FacultyWorkspace facultyMembers={serializedFaculty} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/students-parents/notices renders interactive NoticeWorkspace
  if (href === "/admin/students-parents/notices") {
    // Restricted strictly to SUPER_ADMIN
    await requireRole(["SUPER_ADMIN"], href);

    const notices = await prisma.notice.findMany({
      include: {
        attachments: {
          orderBy: { displayOrder: "asc" },
        },
      },
      orderBy: [
        { displayOrder: "asc" },
        { publishDate: "desc" },
      ],
    });

    const serializedNotices = notices.map((notice) => ({
      ...notice,
      attachments: notice.attachments.map((att) => ({
        ...att,
        createdAt: att.createdAt.toISOString(),
        updatedAt: att.updatedAt.toISOString(),
      })),
      fileUploadedAt: notice.fileUploadedAt ? notice.fileUploadedAt.toISOString() : null,
      publishDate: notice.publishDate.toISOString(),
      publishedAt: notice.publishedAt ? notice.publishedAt.toISOString() : null,
      expiryDate: notice.expiryDate ? notice.expiryDate.toISOString() : null,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <NoticeWorkspace notices={serializedNotices} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/students-parents/downloads renders interactive DownloadWorkspace
  if (href === "/admin/students-parents/downloads") {
    await requireRole(["SUPER_ADMIN"], href);

    const categories = await prisma.downloadCategory.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        documents: {
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
          ],
        },
      },
    });

    const serializedCategories = categories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      documents: cat.documents.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <DownloadWorkspace categories={serializedCategories} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/about/mandatory-disclosure renders interactive DisclosureWorkspace
  if (href === "/admin/about/mandatory-disclosure") {
    await requireRole(["SUPER_ADMIN"], href);

    const sections = await prisma.disclosureSection.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        documents: {
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
          ],
        },
      },
    });

    const serializedSections = sections.map((sec) => ({
      ...sec,
      createdAt: sec.createdAt.toISOString(),
      updatedAt: sec.updatedAt.toISOString(),
      documents: sec.documents.map((doc) => ({
        ...doc,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
      })),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <DisclosureWorkspace sections={serializedSections} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/contact, /admin/contact/directory, /admin/contact/location render ContactWorkspace
  if (
    href === "/admin/contact" ||
    href === "/admin/contact/directory" ||
    href === "/admin/contact/location"
  ) {
    await requireRole(["SUPER_ADMIN"], href);

    let profile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });

    if (!profile) {
      profile = await prisma.siteProfile.create({
        data: { id: "default", schoolName: "Devasthaly Vidyapeeth" },
      });
    }

    const directoryEntries = await prisma.campusDirectoryEntry.findMany({
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    const serializedProfile = {
      ...profile,
      updatedAt: profile.updatedAt.toISOString(),
    };

    const serializedDirectory = directoryEntries.map((entry) => ({
      ...entry,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    }));

    const initialTab: "directory" | "helplines" | "location" =
      href === "/admin/contact/location"
        ? "location"
        : href === "/admin/contact/directory"
        ? "directory"
        : "directory";

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <ContactWorkspace
            profile={serializedProfile}
            directoryEntries={serializedDirectory}
            initialTab={initialTab}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/navigation renders NavigationWorkspace
  if (href === "/admin/navigation") {
    await requireRole(["SUPER_ADMIN"], href);

    const headerItems = await prisma.navigationItem.findMany({
      where: { location: "HEADER_PRIMARY" },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
      include: {
        columns: {
          orderBy: [
            { displayOrder: "asc" },
            { createdAt: "asc" },
          ],
          include: {
            links: {
              orderBy: [
                { displayOrder: "asc" },
                { createdAt: "asc" },
              ],
            },
          },
        },
      },
    });

    const footerAdmissions = await prisma.navigationItem.findMany({
      where: { location: "FOOTER_ADMISSIONS" },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    const footerCommunity = await prisma.navigationItem.findMany({
      where: { location: "FOOTER_COMMUNITY" },
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "asc" },
      ],
    });

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <NavigationWorkspace
            headerItems={headerItems}
            footerAdmissions={footerAdmissions}
            footerCommunity={footerCommunity}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/homepage renders HomepageWorkspace
  if (href === "/admin/homepage") {
    await requireRole(["SUPER_ADMIN"], href);

    const [hero, principal, statistics, highlights] = await Promise.all([
      prisma.homepageHero.findUnique({
        where: { id: "default" },
      }),
      prisma.homepagePrincipalMessage.findUnique({
        where: { id: "default" },
      }),
      prisma.homepageStatistic.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.homepageHighlight.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const serializedHero = hero
      ? {
          ...hero,
          updatedAt: hero.updatedAt.toISOString(),
        }
      : null;

    const serializedPrincipal = principal
      ? {
          ...principal,
          updatedAt: principal.updatedAt.toISOString(),
        }
      : null;

    const serializedStatistics = statistics.map((stat) => ({
      ...stat,
      createdAt: stat.createdAt.toISOString(),
      updatedAt: stat.updatedAt.toISOString(),
    }));

    const serializedHighlights = highlights.map((hl) => ({
      ...hl,
      createdAt: hl.createdAt.toISOString(),
      updatedAt: hl.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <HomepageWorkspace
            hero={serializedHero}
            principal={serializedPrincipal}
            statistics={serializedStatistics}
            highlights={serializedHighlights}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/about-leadership renders AboutLeadershipWorkspace
  if (href === "/admin/about-leadership") {
    await requireRole(["SUPER_ADMIN"], href);

    const [
      aboutSetting,
      credentials,
      narrativeSections,
      vmSetting,
      coreValues,
      leadershipMembers,
    ] = await Promise.all([
      prisma.aboutPageSetting.findUnique({
        where: { id: "default" },
      }),
      prisma.aboutCredential.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.aboutNarrativeSection.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.visionMissionSetting.findUnique({
        where: { id: "default" },
      }),
      prisma.institutionalCoreValue.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.leadershipMember.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const serializedAboutSetting = aboutSetting
      ? {
          ...aboutSetting,
          updatedAt: aboutSetting.updatedAt.toISOString(),
        }
      : null;

    const serializedCredentials = credentials.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    const serializedNarratives = narrativeSections.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    }));

    const serializedVmSetting = vmSetting
      ? {
          ...vmSetting,
          updatedAt: vmSetting.updatedAt.toISOString(),
        }
      : null;

    const serializedCoreValues = coreValues.map((cv) => ({
      ...cv,
      createdAt: cv.createdAt.toISOString(),
      updatedAt: cv.updatedAt.toISOString(),
    }));

    const serializedLeadership = leadershipMembers.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <AboutLeadershipWorkspace
            aboutSetting={serializedAboutSetting}
            credentials={serializedCredentials}
            narrativeSections={serializedNarratives}
            vmSetting={serializedVmSetting}
            coreValues={serializedCoreValues}
            leadershipMembers={serializedLeadership}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/life-at-school/gallery renders interactive GalleryWorkspace
  if (href === "/admin/life-at-school/gallery") {
    await requireRole(["SUPER_ADMIN"], href);

    const albums = await prisma.galleryAlbum.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      include: {
        images: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    const serializedAlbums = albums.map((album) => ({
      ...album,
      createdAt: album.createdAt.toISOString(),
      updatedAt: album.updatedAt.toISOString(),
      images: album.images.map((img) => ({
        ...img,
        createdAt: img.createdAt.toISOString(),
        updatedAt: img.updatedAt.toISOString(),
      })),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <GalleryWorkspace albums={serializedAlbums} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/academics/events renders interactive EventsWorkspace
  if (href === "/admin/academics/events") {
    await requireRole(["SUPER_ADMIN"], href);

    const events = await prisma.schoolEvent.findMany({
      orderBy: [{ displayOrder: "asc" }, { isoDate: "asc" }, { createdAt: "asc" }],
    });

    const serializedEvents = events.map((event) => ({
      ...event,
      category: event.category || "School Event",
      coverImageAlt: event.coverImageAlt || "",
      isoDate: event.isoDate ? event.isoDate.toISOString().split("T")[0] : "",
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <EventsWorkspace events={serializedEvents} />
        </div>
      </Card>
    );
  }


  // Specialization: /admin/life-at-school/facilities renders interactive FacilityWorkspace
  if (href === "/admin/life-at-school/facilities") {
    await requireRole(["SUPER_ADMIN"], href);

    const categories = await prisma.facilityCategory.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      include: {
        items: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    const serializedCategories = categories.map((cat) => ({
      ...cat,
      createdAt: cat.createdAt.toISOString(),
      updatedAt: cat.updatedAt.toISOString(),
      items: cat.items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <FacilityWorkspace categories={serializedCategories} />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/admissions renders interactive AdmissionsWorkspace
  if (href === "/admin/admissions") {
    await requireRole(["SUPER_ADMIN"], href);

    const [enquiries, steps, eligibilityCriteria, documentRequirements, faqs] =
      await Promise.all([
        prisma.enquirySubmission.findMany({
          orderBy: [{ createdAt: "desc" }],
        }),
        prisma.admissionStep.findMany({
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        }),
        prisma.admissionEligibilityCriteria.findMany({
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        }),
        prisma.admissionDocumentRequirement.findMany({
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        }),
        prisma.admissionFaq.findMany({
          orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
        }),
      ]);

    const serializedEnquiries = enquiries.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }));

    const serializedSteps = steps.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));

    const serializedCriteria = eligibilityCriteria.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    const serializedDocuments = documentRequirements.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }));

    const serializedFaqs = faqs.map((f) => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
      updatedAt: f.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <AdmissionsWorkspace
            enquiries={serializedEnquiries}
            steps={serializedSteps}
            eligibilityCriteria={serializedCriteria}
            documentRequirements={serializedDocuments}
            faqs={serializedFaqs}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/life-at-school/activities renders interactive ActivitiesWorkspace
  if (href === "/admin/life-at-school/activities") {
    await requireRole(["SUPER_ADMIN"], href);

    const [overview, clubs] = await Promise.all([
      prisma.activityOverview.findUnique({
        where: { id: "default" },
      }),
      prisma.studentClub.findMany({
        orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      }),
    ]);

    const serializedOverview = overview
      ? {
          ...overview,
          createdAt: overview.createdAt.toISOString(),
          updatedAt: overview.updatedAt.toISOString(),
        }
      : null;

    const serializedClubs = clubs.map((club) => ({
      ...club,
      createdAt: club.createdAt.toISOString(),
      updatedAt: club.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <ActivitiesWorkspace
            overview={serializedOverview}
            clubs={serializedClubs}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/students-parents/instructions renders interactive InstructionsWorkspace
  if (href === "/admin/students-parents/instructions") {
    await requireRole(["SUPER_ADMIN"], href);

    const [overview, instructions] = await Promise.all([
      prisma.instructionOverview.findUnique({
        where: { id: "default" },
      }),
      prisma.generalInstruction.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const serializedOverview = overview
      ? {
          ...overview,
          createdAt: overview.createdAt.toISOString(),
          updatedAt: overview.updatedAt.toISOString(),
        }
      : null;

    const serializedInstructions = instructions.map((inst) => ({
      ...inst,
      createdAt: inst.createdAt.toISOString(),
      updatedAt: inst.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <InstructionsWorkspace
            overview={serializedOverview}
            instructions={serializedInstructions}
          />
        </div>
      </Card>
    );
  }

  // Specialization: /admin/students-parents/alumni renders interactive AlumniWorkspace
  if (href === "/admin/students-parents/alumni") {
    await requireRole(["SUPER_ADMIN"], href);

    const [overview, reunions, opportunities] = await Promise.all([
      prisma.alumniOverview.findUnique({
        where: { id: "default" },
      }),
      prisma.alumniReunion.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
      prisma.careerOpportunity.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const serializedOverview = overview
      ? {
          ...overview,
          createdAt: overview.createdAt.toISOString(),
          updatedAt: overview.updatedAt.toISOString(),
        }
      : null;

    const serializedReunions = reunions.map((reunion) => {
      const { heroImageStorageKey: _omittedKey, ...rest } = reunion;
      void _omittedKey;
      return {
        ...rest,
        createdAt: reunion.createdAt.toISOString(),
        updatedAt: reunion.updatedAt.toISOString(),
      };
    });

    const serializedOpportunities = opportunities.map((opp) => ({
      ...opp,
      createdAt: opp.createdAt.toISOString(),
      updatedAt: opp.updatedAt.toISOString(),
    }));

    return (
      <Card as="section" aria-labelledby="admin-workspace-title">
        <Breadcrumbs items={workspace.breadcrumbs} />

        <div className="workspace-header">
          <h1 className="workspace-title" id="admin-workspace-title" tabIndex={-1}>
            {workspace.title}
          </h1>
          {workspace.badge && <Badge>{workspace.badge}</Badge>}
        </div>

        {workspace.description && (
          <p className="workspace-description">{workspace.description}</p>
        )}

        <div className="workspace-meta-bar">
          <PublicReferenceLink
            publicHref={workspace.publicHref}
            title={workspace.title}
          />
        </div>

        <div className="workspace-content">
          <AlumniWorkspace
            overview={serializedOverview}
            reunions={serializedReunions}
            opportunities={serializedOpportunities}
          />
        </div>
      </Card>
    );
  }

  return <PlaceholderWorkspace workspace={workspace} />;
}
