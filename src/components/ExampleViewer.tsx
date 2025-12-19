'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';

// Example Data
const EXAMPLES: Record<string, { md: string, jsonld: object }> = {
    skill: {
        md: `---
id: diagnose_network
name: Network Diagnosis
description: Diagnoses network connectivity issues using system tools.
required_tools: [ping, traceroute]
---

# ROLE
You are a Network Reliability Engineer.

# PROTOCOL
1. > ACTION: CHECK_CONNECTIVITY using "ping 8.8.8.8"
2. ? DECISION: IF failure THEN > ACTION: TRACE_ROUTE`,
        jsonld: {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "Network Diagnosis",
            "description": "Diagnoses network connectivity issues using system tools.",
            "step": [
                {
                    "@type": "HowToStep",
                    "text": "Check connectivity using ping",
                    "itemListElement": {
                        "@type": "HowToDirection",
                        "text": "ACTION: CHECK_CONNECTIVITY using \"ping 8.8.8.8\""
                    }
                }
            ]
        }
    },
    competency: {
        md: `---
id: sre_engineer
name: Site Reliability Engineer
description: Ensures reliability of production systems.
skills:
  - diagnose_network
  - restart_service
---

# ORCHESTRATION (Behavior Tree)
type: Selector
children:
  - type: Action
    skill_ref: diagnose_network
  - type: Action
    skill_ref: restart_service`,
        jsonld: {
            "@context": "https://schema.org",
            "@type": "Role",
            "roleName": "Site Reliability Engineer",
            "hasPart": [
                { "@type": "HowTo", "name": "Network Diagnosis" },
                { "@type": "HowTo", "name": "Restart Service" }
            ]
        }
    },
    tool: {
        md: `---
id: ping
name: Ping Utility
description: Sends ICMP Echo Request to a target host.
---

# DEFINITION
source:
  type: local
  path: src/utils/network.ts
  functionName: ping

parameters:
  target:
    type: string
    description: Hostname or IP address

safety:
  isDeterministic: true
  sideEffects: false`,
        jsonld: {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Ping Utility",
            "applicationCategory": "NetworkTool",
            "featureList": ["ICMP Echo Request"]
        }
    },
    concept: {
        md: `---
id: network_latency
name: Network Latency
description: The time it takes for data to travel from source to destination.
alignment:
  - name: Wikidata
    url: https://www.wikidata.org/wiki/Q1163909
related_to:
  - packet_loss
  - bandwidth
---`,
        jsonld: {
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            "name": "Network Latency",
            "description": "The time it takes for data to travel from source to destination.",
            "sameAs": "https://www.wikidata.org/wiki/Q1163909"
        }
    }
};

export function ExampleViewer({ type }: { type: string }) {
    const [tab, setTab] = useState(0);
    const example = EXAMPLES[type];

    if (!example) return null;

    return (
        <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden', mb: 6 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default', px: 2 }}>
                <Typography variant="subtitle2" sx={{ py: 2, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', color: 'text.secondary' }}>
                    Usage Examples
                </Typography>
            </Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="example tabs">
                    <Tab label="Authoring Format (Markdown/Code)" />
                    <Tab label="Agent Output (JSON-LD)" />
                </Tabs>
            </Box>
            <Box sx={{ p: 3, bgcolor: '#f8f9fa', fontFamily: 'monospace', fontSize: '0.875rem', overflowX: 'auto' }}>
                <pre style={{ margin: 0 }}>
                    {tab === 0 ? example.md : JSON.stringify(example.jsonld, null, 2)}
                </pre>
            </Box>
        </Paper>
    );
}
