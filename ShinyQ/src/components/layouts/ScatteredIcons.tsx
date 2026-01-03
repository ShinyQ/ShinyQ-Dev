'use client';

import {
    DiJavascript,
    DiPython,
    DiReact,
    DiNodejs,
    DiMongodb,
    DiPostgresql,
    DiDocker,
    DiGit,
    DiGithub,
    DiAngularSimple,
    DiSass,
    DiGo,
    DiRust,
    DiPhp,
    DiLaravel,
    DiJava,
    DiHtml5,
    DiCss3,
    DiSwift,
    DiDjango,
    DiAws,
    DiBootstrap,
    DiJenkins,
    DiNginx,
} from 'react-icons/di';

import type { IconType } from 'react-icons';

interface IconConfig {
    Icon: IconType;
    x: string;
    y: string;
    mobileX?: string;
    mobileY?: string;
}

const icons: IconConfig[] = [
    // Top area
    { Icon: DiJavascript, x: '5%', y: '15%', mobileX: '10%', mobileY: '5%' },
    { Icon: DiPython, x: '15%', y: '5%', mobileX: '30%', mobileY: '10%' },
    { Icon: DiReact, x: '25%', y: '20%', mobileX: '50%', mobileY: '15%' },
    { Icon: DiNodejs, x: '35%', y: '10%', mobileX: '70%', mobileY: '20%' },
    { Icon: DiMongodb, x: '45%', y: '25%', mobileX: '20%', mobileY: '25%' },
    { Icon: DiPostgresql, x: '55%', y: '15%', mobileX: '40%', mobileY: '30%' },
    { Icon: DiDocker, x: '65%', y: '5%', mobileX: '60%', mobileY: '35%' },
    { Icon: DiGit, x: '75%', y: '20%', mobileX: '80%', mobileY: '40%' },
    { Icon: DiGithub, x: '85%', y: '10%', mobileX: '30%', mobileY: '45%' },
    { Icon: DiNginx, x: '95%', y: '15%', mobileX: '50%', mobileY: '50%' },

    // Middle area
    { Icon: DiAngularSimple, x: '10%', y: '35%', mobileX: '70%', mobileY: '55%' },
    { Icon: DiSass, x: '20%', y: '45%', mobileX: '20%', mobileY: '60%' },
    { Icon: DiGo, x: '30%', y: '55%', mobileX: '40%', mobileY: '65%' },
    { Icon: DiRust, x: '40%', y: '45%', mobileX: '60%', mobileY: '70%' },
    { Icon: DiPhp, x: '50%', y: '60%', mobileX: '80%', mobileY: '75%' },
    { Icon: DiLaravel, x: '60%', y: '50%', mobileX: '30%', mobileY: '80%' },
    { Icon: DiJava, x: '70%', y: '55%', mobileX: '50%', mobileY: '85%' },
    { Icon: DiHtml5, x: '80%', y: '45%', mobileX: '70%', mobileY: '90%' },
    { Icon: DiCss3, x: '90%', y: '60%', mobileX: '40%', mobileY: '95%' },

    // Bottom area
    { Icon: DiDjango, x: '10%', y: '75%', mobileX: '60%', mobileY: '100%' },
    { Icon: DiBootstrap, x: '20%', y: '85%', mobileX: '80%', mobileY: '105%' },
    { Icon: DiJenkins, x: '30%', y: '95%', mobileX: '30%', mobileY: '110%' },
    { Icon: DiSwift, x: '50%', y: '75%', mobileX: '50%', mobileY: '115%' },
    { Icon: DiAws, x: '70%', y: '90%', mobileX: '70%', mobileY: '120%' },
];

export default function ScatteredIcons() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
            <div className="absolute inset-0">
                {icons.map(({ Icon, x, y, mobileX, mobileY }, index) =>
                    Icon ? (
                        <div key={index}>
                            <Icon
                                className="absolute text-muted/20 hover:text-muted/40 transition-colors duration-300 hidden md:block icon-scatter"
                                style={{
                                    left: x,
                                    top: y,
                                }}
                                size={130}
                            />
                            <Icon
                                className="absolute text-muted/20 hover:text-muted/40 transition-colors duration-300 md:hidden icon-scatter"
                                style={{
                                    left: mobileX,
                                    top: mobileY,
                                }}
                                size={60}
                            />
                        </div>
                    ) : null
                )}
            </div>
        </div>
    );
}
