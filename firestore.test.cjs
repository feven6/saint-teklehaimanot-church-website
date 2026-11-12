const fs = require("node:fs");

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} = require("@firebase/rules-unit-testing");



const {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  deleteDoc,
  serverTimestamp
} = require("firebase/firestore");


async function main() {
  const testEnv = await initializeTestEnvironment({
    projectId: "demo-church-security",
    firestore: {
        host: "127.0.0.1",
        port: 8080,
        rules: fs.readFileSync("firestore.rules", "utf8")
    }
  });

  
  try {
    // Clear local emulator data before each test run.
    await testEnv.clearFirestore();

    // Create a fake pending video, bypassing rules for setup.

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      await setDoc(doc(db, "submissions", "test-video"), {
        ownerId: "member1",
        ownerName: "Test Member",
        title: "Test Video",
        description: "",
        type: "video",
        videoId: "abcdefghijk",
        status: "pending",
        createdAt: serverTimestamp()
      });
    });

    // Sign in as a regular member, not an administrator.
    const member = testEnv.authenticatedContext("member1", {
      email: "test@example.com",
      email_verified: true
    });

    const db = member.firestore();

    // Test 1: Regular members cannot approve videos.
    await assertFails(
      updateDoc(doc(db, "submissions", "test-video"), {
        status: "approved",
        reviewedBy: "member1",
        reviewedAt: serverTimestamp()
      })
    );
    console.log("PASS: Regular member cannot approve videos.");

    // Test 2: Regular members cannot make themselves admins.
    await assertFails(
      setDoc(doc(db, "admins", "member1"), {
        role: "admin"
      })
    );
    console.log("PASS: Regular member cannot become an admin.");

    // Create a fake administrator for testing.
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "admins", "admin1"),
        { role: "admin" }
      );
    });

    // Sign in as the fake administrator.
    const admin = testEnv.authenticatedContext("admin1", {
      email: "admin@example.com",
      email_verified: true
    });

    // Test 3: Administrators can approve pending videos.
    await updateDoc(
      doc(admin.firestore(), "submissions", "test-video"),
      {
        status: "approved",
        reviewedBy: "admin1",
        reviewedAt: serverTimestamp()
      }
    );

    console.log("PASS: Administrator can approve videos.");


    // Create a pending video owned by another member.
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), "submissions", "private-video"),
        {
          ownerId: "member2",
          ownerName: "Another Member",
          title: "Private Pending Video",
          description: "",
          type: "video",
          videoId: "abcdefghijk",
          status: "pending",
          createdAt: serverTimestamp()
        }
      );
    });

    // Test 4: Members cannot read another member's pending video.
    await assertFails(
      getDoc(doc(db, "submissions", "private-video"))
    );

    console.log("PASS: Member cannot view another member's pending video.");


    // Test 5: Visitors can read approved videos.
    const visitor = testEnv.unauthenticatedContext();

    await assertSucceeds(
      getDoc(
        doc(visitor.firestore(), "submissions", "test-video")
      )
    );

    console.log("PASS: Visitors can view approved videos.");


    // Test 6: Visitors cannot view pending videos.
    await assertFails(
      getDoc(
        doc(visitor.firestore(), "submissions", "private-video")
      )
    );

    console.log("PASS: Visitors cannot view pending videos.");

    // Test 7: Verified members can submit videos.
    await assertSucceeds(
      setDoc(
        doc(db, "submissions", "new-member-video-2"),
       {
          ownerId: "member1",
          ownerName: "Test Member",
          title: "My Church Video",
          description: "A video from our church event",
          type: "video",
          videoId: "abcdefghijk",
          status: "pending",
          createdAt: serverTimestamp()
        }
      )
    );

    console.log("PASS: Verified members can submit videos.");


    // Test 8: Unverified members cannot submit videos.
    const unverifiedMember = testEnv.authenticatedContext(
      "member3",
      {
        email: "unverified@example.com",
        email_verified: false
      }
    );

    await assertFails(
      setDoc(
        doc(
          unverifiedMember.firestore(),
          "submissions",
          "unverified-video"
        ),
        {
          ownerId: "member3",
          ownerName: "Unverified Member",
          title: "Church Event Video",
          description: "Test submission",
          type: "video",
          videoId: "abcdefghijk",
          status: "pending",
          createdAt: serverTimestamp()
        }
      )
    );

    console.log("PASS: Unverified members cannot submit videos.");


    // Test 9: Members cannot approve their own submissions.
    await assertFails(
      setDoc(
        doc(db, "submissions", "bypass-approval-test"),
        {
          ownerId: "member1",
          ownerName: "Test Member",
          title: "Bypass Approval Test",
          description: "Testing approval security",
          type: "video",
          videoId: "abcdefghijk",
          status: "approved",
          createdAt: serverTimestamp()
        }
      )
    );

    console.log("PASS: Members cannot bypass administrator approval.");


    // Test 10: Members cannot edit approved videos.
    await assertFails(
      updateDoc(
        doc(db, "submissions", "test-video"),
        {
          title: "Changed Without Permission"
        }
      )
    );

    console.log("PASS: Members cannot edit approved videos.");


    // Test 11: Regular members cannot delete submissions.
    await assertFails(
      deleteDoc(
        doc(db, "submissions", "test-video")
      )
    );

    console.log("PASS: Members cannot delete submissions.");


    // Test 12: Regular members cannot remove approved videos.
    await assertFails(
      updateDoc(
        doc(db, "submissions", "test-video"),
        {
          status: "removed",
          reviewedBy: "member1",
          reviewedAt: serverTimestamp()
        }
      )
    );

    console.log("PASS: Members cannot remove approved videos.");


    // Test 13: Administrators can remove approved videos.
    await assertSucceeds(
      updateDoc(
        doc(admin.firestore(), "submissions", "test-video"),
        {
          status: "removed",
          reviewedBy: "admin1",
          reviewedAt: serverTimestamp()
        }
      )
    );

    console.log("PASS: Administrators can remove approved videos.");


    // Test 15: Administrator can approve a video for Celebrations.
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), "submissions", "celebration-video"), {
        ownerId: "member2", ownerName: "Member", title: "Feast Day",
        description: "", type: "video", videoId: "abcdefghijk",
        status: "pending", createdAt: serverTimestamp()
      });
    });
    await assertSucceeds(updateDoc(doc(admin.firestore(), "submissions", "celebration-video"), {
      status: "approved", destination: "celebrations",
      reviewedBy: "admin1", reviewedAt: serverTimestamp()
    }));
    console.log("PASS: Administrator can publish to Celebrations.");

    // Test 16: Members cannot choose the publication destination.
    await assertFails(updateDoc(doc(db, "submissions", "celebration-video"), {
      destination: "community"
    }));
    console.log("PASS: Members cannot change destinations.");

    // Test 17: An administrator cannot use an unrecognized destination.
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), "submissions", "bad-destination"), {
        ownerId: "member2", ownerName: "Member", title: "Test",
        description: "", type: "video", videoId: "abcdefghijk",
        status: "pending", createdAt: serverTimestamp()
      });
    });
    await assertFails(updateDoc(doc(admin.firestore(), "submissions", "bad-destination"), {
      status: "approved", destination: "private",
      reviewedBy: "admin1", reviewedAt: serverTimestamp()
    }));
    console.log("PASS: Unknown destinations are rejected.");

    // Test 14: Visitors cannot view removed videos.
    await assertFails(
      getDoc(
        doc(visitor.firestore(), "submissions", "test-video")
      )
    );

    console.log("PASS: Visitors cannot view removed videos.");





  } finally {
    await testEnv.cleanup();
  }
}

main().catch((error) => {
  console.error("Security test failed:", error);
  process.exitCode = 1;
});
