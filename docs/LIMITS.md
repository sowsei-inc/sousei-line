# Current limits

Sousei-line intentionally documents what its evidence does **not** prove.

## Current known limits

1. **AI-provider independence is not guaranteed.** The current production Requirements Review and Independent Verification paths may use systems from the same provider family. Their independence is structural and procedural, not provider-family independence.

2. **Human ADOPT is not yet mechanically enforced at every GitHub boundary.** The process requires explicit human adoption before merge, but branch protection, merge, and deployment do not currently prove that requirement mechanically.

3. **Production Verification does not prove served-byte provenance.** A successful deployment event can report a revision and a later probe can verify observable production markers. That does not by itself prove that the bytes returned to the probe were built from that revision.

4. **CI proves only its configured checks.** Green deterministic CI is not a product-quality certificate and does not prove semantic correctness.

5. **AI review is bounded evidence.** Requirements Review and Independent Verification can miss defects, misunderstand requirements, or share correlated failure modes.

6. **Product-specific risk remains product-specific.** Security-, privacy-, financial-, medical-, safety-, or other high-risk products may require specialist review and additional gates not defined by the base line.

7. **No zero-risk guarantee.** PASS, ADOPT, successful deployment, and Production Verification each have stage-specific meanings. None means "defect-free," "secure in all respects," or "safe for every use."

## Deliberately deferred hardening

The initial public line does not require these before publication:

- artifact digest / stronger build provenance;
- mechanical ADOPT-to-merge enforcement;
- provider-family-separated AI reviewers;
- automated rollback;
- risk-class-specific specialist gates.

These may be added when they solve an observed trust or operating problem. Adding more reviewers solely to make the process look safer is not a goal.
