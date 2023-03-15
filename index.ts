import { spawn } from 'child_process'


interface IConfig {
    containerName: string,
    port: string,
    username: string
    password: string
}

const config: IConfig = {
    containerName: process.argv[2],
    port: process.argv[3],
    username: process.argv[4],
    password: process.argv[5]
}

console.log(`Username: ${config.username}`);
console.log(`Password: ${config.password}`);
console.log(`Container: ${config.containerName}`);
console.log(`Port: ${config.port}`);



const parseDocker = (parseConfig: IConfig) => {

    const isEmpty = !Object.values(parseConfig).every(x => x !== undefined);

    if (isEmpty) {
        console.error('Error! One of the parameters is missing')
        return
    }

    const spawnData = spawn("docker", ["ps", "-q", "-f", `name=${parseConfig.containerName}`]);

    spawnData.stdout.on("data", (data: Buffer) => {
        const containersIds: string[] = data.toString().split("\n");
        containersIds.pop();
        containersIds.push('testIDforError')

        // containersIds.forEach((containerId: string) => {
        //     const swawnItem = spawn("docker", ["exec", containerId, "curl", "-X", "POST", `http://localhost:${parseConfig.port}/geoserver/rest/reload`, "--user", `${parseConfig.username}:${parseConfig.password}`]);
        //     swawnItem.stdout.on("data", (item: Buffer) => {
        //         console.log(item.toString());
        //     });
        // });
        const promises = containersIds.map((containerId: string) => {
            return new Promise<void>((resolve, reject) => {
                //const swawnItem = spawn("docker", ["exec", containerId, "curl", "-X", "POST", `http://localhost:${parseConfig.port}/geoserver/rest/reload`, "--user", `${parseConfig.username}:${parseConfig.password}`]);
                const swawnItem = spawn("docker", ["exec", containerId, "ls"]);
                swawnItem.stdout.on("data", (item: Buffer) => {
                    resolve();
                });

                swawnItem.stderr.on("data", (item: Buffer) => {
                    reject();
                });
            });
        });

        Promise.allSettled(promises).then((results) => {
                results.forEach((result, index) => {
                    const containerId = containersIds[index];
                    if (result.status === 'fulfilled') {
                        console.log(`Container ${containerId} succeeded`);
                    } else {
                        console.error(`Container ${containerId} failed`);
                    }
                });
            })
            

    });



}

parseDocker(config)

