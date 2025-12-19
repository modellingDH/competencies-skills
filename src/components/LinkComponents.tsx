'use client';

import Link from 'next/link';
import Button, { type ButtonProps } from '@mui/material/Button';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';
import { forwardRef } from 'react';

// LinkButton
export const LinkButton = forwardRef<HTMLButtonElement, ButtonProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>>(
    function LinkButton({ href, ...props }, ref) {
        return (
            <Button
                component={Link}
                href={href}
                ref={ref}
                {...props}
            />
        );
    }
);

// LinkIconButton
export const LinkIconButton = forwardRef<HTMLButtonElement, IconButtonProps & { href: string }>(
    function LinkIconButton({ href, ...props }, ref) {
        return (
            <IconButton
                component={Link}
                href={href}
                ref={ref}
                {...props}
            />
        );
    }
);
