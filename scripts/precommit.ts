import { spawn } from 'child_process';
class PrecommitHook {
    public async run() {
        let statusCode = 0;
        try {
            await this.stashNotStagedFiles();
            await this.tsLint();
            await this.runTests();
        }
        catch (err) {
            if (err) console.error(err);
            statusCode = 1;
        }
        finally {
            await this.popNotStagesFiles();
            process.exit(statusCode);
        }
    }
    private async stashNotStagedFiles(): Promise<void> {
        const msg = "stashing not staged files";
        const cmd = "git";
        const params = ['stash', '-u', '--keep-index'];
        return this.spawnProcess(msg, cmd, params);
    }

    private tsLint() {
        const msg = "lint";
        const cmd = "npm";
        const params = ['run', 'lint'];
        return this.spawnProcess(msg, cmd, params);
    }

    private runTests() {
        const msg = "test";
        const cmd = "npm";
        const params = ['run', 'test'];
        return this.spawnProcess(msg, cmd, params);
    }

    private popNotStagesFiles() {
        const msg = "pop not staged files";
        const cmd = "git";
        const params = ['stash', 'pop', '-q'];
        return this.spawnProcess(msg, cmd, params);
    }


    private async spawnProcess(messageText: string, cmd: string, params: string[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.message(messageText);
            let s = spawn(cmd, params, { stdio: 'inherit' });
            s.on('close', (code) => {
                if (code > 0) reject();
                resolve();
            });
            s.on('error', (err) => {
                console.log('Failed to start child process.', err);
                reject();
            });
        });
    }
    private message(value: string): void {
        console.log(`***----------------------------------------  ${value}  ----------------------------------------***`);
    }

}

const hook = new PrecommitHook();
hook.run();